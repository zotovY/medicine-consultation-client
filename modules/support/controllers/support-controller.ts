import { action, makeObservable, observable } from "mobx";
import { injectable } from "inversify";
import axios from "axios";
import TokenServices from "@/services/token-services";
import { authFetch, EAuthFetch } from "@/services/fetch_services";
import SupportManager from "@/modules/support/manager";

@injectable()
export default class SupportController {

    constructor() {
        makeObservable(this);
    }

    @observable loading = true;
    @observable chats: SupportChatType[] = [];
    fetchedChats = false;

    // Create state
    @observable createTitle = "";
    @observable createProblem?: string;
    createDescription = "";
    @observable createTitleError?: string;
    @observable createProblemError?: string;
    @observable createDescriptionError?: string;
    @observable isConsultationSelectorLoading = true;
    consultationSelectorValue = "";
    @observable consultationSelectorError?: string;
    @observable availableConsultations: { values: string[], options: string[] } = {
        values: [],
        options: [],
    };

    // Chat state
    @observable chatMessage = "";

    goBackCb = () => {}

    public fetchChats = () => {
        this.loading = true;
        action(async () => {
            this.chats = await this._fetchChats().catch((e) => {
                throw e;
            });
            this.loading = false;
        })();
    }

    private _fetchChats = async (): Promise<SupportChatType[]> => {
        const isUser = localStorage.getItem("isUser") === "true";
        const route = `/api/${isUser ? "user" : "doctor"}/support-questions`;
        const res = await authFetch(() => axios.get(
            process.env.SERVER_URL + route,
            {
                headers: { auth: TokenServices.header },
            }
        ));

        if (res.status === EAuthFetch.Error) throw "error";
        if (res.status === EAuthFetch.Unauthorized) throw "logout";

        this.fetchedChats = true;
        return (res.data.questions ?? []).map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
            messages: e.messages.map((el: any) => ({ ...el, date: new Date(el.date) }))
        }));
    }

    @action fetchConsultation = async (): Promise<void> => {
        if (!this.isConsultationSelectorLoading) return;

        const consultations = await SupportManager.fetchConsultation(localStorage.getItem("uid") as string);
        this.isConsultationSelectorLoading = false;
        this.availableConsultations = {
            options: consultations.map(e => `${(e.doctor as DoctorType).fullName} – ${e.date.toLocaleString()}`),
            values: consultations.map(e => e._id),
        }
    }

    public createQuestion = async () => {
        this.loading = true;
        if (!this._validate()) return;


        const isUser = localStorage.getItem("isUser") === "true";
        const res = await authFetch(() => axios.post(
            process.env.SERVER_URL + "/api/support/create-chat",
            {
                title: this.createTitle,
                message: this.createDescription,
                problem: this.createProblem,
                isUser,
                payload: {
                    consultationId: this.consultationSelectorValue
                }
            },
            {
                headers: { auth: TokenServices.header },
            }
        ));
        if (res.status === EAuthFetch.Error) throw "error";
        if (res.status === EAuthFetch.Unauthorized) throw "logout";

        action(() => {
            const { number } = res.data;
            const chat: SupportChatType = {
                messages: [{
                    date: new Date(),
                    isUser: true,
                    content: this.createDescription,
                }],
                _id: "",
                problem: this.createProblem as SupportChatProblemType,
                title: this.createTitle,
                user: localStorage.getItem("uid") as string,
                number,
                timestamp: new Date(),
                readByUser: true,
            };
            this.chats.push(chat);
            this.loading = false;
            this.goBackCb();
        })();
    }

    @action private _validate = (): boolean => {
        this.createTitleError = undefined;
        this.createProblemError = undefined;
        this.createDescriptionError = undefined;
        this.consultationSelectorError = undefined;
        let ok = true;

        if (!this.createTitle || this.createTitle.length < 8 || this.createTitle.length > 120) {
            this.createTitleError = "Название должно быть от 8 до 120 символов в длину";
            ok = false
        }

        if (!this.createProblem) {
            this.createProblemError = "Это поле обязательно";
            ok = false
        }

        if (!this.createDescription || this.createDescription.length < 1 || this.createDescription.length > 4086) {
            this.createDescriptionError = "Описание должно быть до 4086 символов в длину";
            ok = false
        }

        if (this.createProblem === "Doctor" && this.consultationSelectorValue === "") {
            this.consultationSelectorError = "Это поле обязательно";
            ok = false;
        }

        return ok;
    }

    public setReadByUser = async (chatId: string) => {
        const index = this.chats.findIndex(e => e._id === chatId);
        this.chats[index].readByUser = true;

        const isUser = localStorage.getItem("isUser") === "true";
        const route = `/api/${isUser ? "user" : "doctor"}/support-questions/${chatId}/read-messages`;
        const res = await authFetch(() => axios.post(
            process.env.SERVER_URL + route,
            {},
            {
                headers: { auth: TokenServices.header },
            }
        ));
        if (res.status === EAuthFetch.Error) throw "error";
        if (res.status === EAuthFetch.Unauthorized) throw "logout";
    }

    public sendMessage = async (chatId: string) => {
        const messageContent = this.chatMessage

        action(() => {
            const message: SupportMessageType = {
                content: messageContent,
                isUser: true,
                date: new Date(),
            }
            this.chatMessage = "";
            const index = this.chats.findIndex(e => e._id === chatId);
            this.chats[index].messages.push(message);
        })();

        const isUser = localStorage.getItem("isUser") === "true";
        const route = `/api/${isUser ? "user" : "doctor"}/support-questions/${chatId}/send-message`;
        const res = await authFetch(() => axios.post(
            process.env.SERVER_URL + route,
            {
                message: messageContent
            },
            {
                headers: { auth: TokenServices.header },
            }
        ));
        if (res.status === EAuthFetch.Error) throw "error";
        if (res.status === EAuthFetch.Unauthorized) throw "logout";
    }
}
