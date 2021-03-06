import { observable, action, makeObservable } from "mobx";
import jsonp from "jsonp";
import axios from "axios";
import { injectable } from "inversify";

export type Config = {
    fullName?: string,
    specialities?: string[],
    child?: string[],
    workExperience?: string[],
    qualification?: string[],
    workPlan?: string[],
    city?: string[],
    rating?: number[],
}

export enum ESortBy {
    rating = "rating",
    experience = "experience"
}

@injectable()
export default class FindDoctorController {

    constructor() {
        makeObservable(this);
    }

    @observable doctors: DoctorType[] = [];
    @observable isLoading: boolean = false;
    @observable isInfinyLoading: boolean = false;
    @observable currentPage = 0;
    @observable isErrorBadgeOpen: boolean = false;
    private amountDoctorsOnOnePage = 50;

    @action onComponentReady = (config: Config) => {
        this.name = config.fullName ?? "";
        this.specialities = config.specialities ?? [];
        this.child = config.child ?? [];
        this.workExperience = config.workExperience ?? [];
        this.qualification = config.qualification ?? [];
        this.workPlan = config.workPlan ?? [];
        this.selectedCities = config.city ?? [];
        this.rating = config.rating ?? [];
    }

    fetchDoctors = (config: Config) => {
        this.onComponentReady(config);
        this.isLoading = true;
        this._fetchDoctors(0, 50, true).then((docs) => {
            this.doctors = docs;
            this.isLoading = false;
        });
    }

    @observable setDoctors = (config: Config, doctors: DoctorType[]) => {
        this.onComponentReady(config);
        this.isLoading = false;
        this.doctors = doctors;
    }

    getConfig = (queries: any): Config => {
        const q: (keyof Config)[] = ["fullName", "specialities", "child", "workExperience", "qualification", "workPlan", "city"];
        const config: Config = {};

        q.forEach((e) => {
            if (queries[e]) {
                // @ts-ignore
                config[e] = (queries[e] as string).split(",");
            }
        });

        try {
            if (queries['rating']) {
                config["rating"] = (queries["rating"] as string).split(",").map(e => parseInt(e));
            }
        } catch (e) {}

        return config;
    }

    onChangeLocation = () => {};

    // Filters
    @observable mobileFiltersOpen: boolean = false;
    @observable sortByFilterOpen: boolean = false;
    @observable name: string = "";
    @observable isDownward: boolean = false;
    @observable openedFilter: string = "";
    @observable activeFilters: string[] = [];
    @observable specialities: string[] = [];
    @observable qualification: string[] = [];
    @observable workExperience: string[] = [];
    @observable rating: number[] = [];
    @observable isSelectCityModalOpen: boolean = false;
    @observable selectedCities: string[] = [];
    @observable queryCities: string[] = [];
    @observable workPlan: string[] = [];
    @observable child: string[] = [];
    @observable private _sortBy: ESortBy = ESortBy.rating;

    loadNextPage = async () => {
        if (this.isInfinyLoading) {
            return;
        }

        this.isInfinyLoading = true;

        const doctors = await this._fetchDoctors(
            this.currentPage * this.amountDoctorsOnOnePage,
            50,
            true
        );
        this.setDoctorAndOffLoading(doctors);
    };

    @action private setDoctorAndOffLoading = (doctors: DoctorType[]) => {
        this.doctors = this.doctors.concat(this.doctors, doctors);
        this.isInfinyLoading = false;
        this.currentPage += 1;
    };

    private getFilter = (from: number, amount: number): string => {
        let filter = "";

        const mapFilter = {
            from,
            amount,
            fullName: this.name,
            isDownward: this.isDownward,
            _qualification: this.qualification,
            rating: this.rating,
            city: this.selectedCities,
            workPlan: this.workPlan,
            sortBy: this._sortBy,
        };

        Object.keys(mapFilter).forEach((key) => {
            // @ts-ignore
            const value = mapFilter[key];

            const defined = Array.isArray(value)
                ? value.length > 0
                : !!value;

            if (defined) {
                filter += `&${key}=${JSON.stringify(value)}`;
            }
        });

        //* Speciality
        if (this.specialities.length > 0) {
            const mapSpeciality = {
                Педиатр: "Pediatrician",
                Терапевт: "Therapist",
                Дерматолог: "Dermatologist",
                Психолог: "Psychologist",
                Дефектолог: "Defectologis",
                Логопед: "Logopedist",
                Диетолог: "Nutritionist",
                Аллерголог: "Allergist",
            };

            const speciality: string[] = [];
            this.specialities.forEach((key) => {
                // @ts-ignore
                speciality.push(mapSpeciality[key]);
            });

            filter += `&speciality=${JSON.stringify(speciality)}`;
        }

        //* Experience
        if (this.workExperience.length > 0) {
            const mapExperience = {
                "Меньше 1 года": "Less Year",
                "1 год": "OneYear",
                "3 года": "ThreeYears",
                "5 лет": "FiveYears",
                "Больше 5 лет": "MoreFiveYears",
            };

            const experience: string[] = [];
            this.workExperience.forEach((key) => {
                // @ts-ignore
                experience.push(mapExperience[key]);
                console.log(key);
            });

            filter += `&experience=${JSON.stringify(experience)}`;
        }

        //* Child
        if (this.child.length !== 0) {
            filter += `&isChild=${this.child.includes("child")}`;
            filter += `&isAdult=${this.child.includes("adult")}`;
        }

        return filter;
    };

    _fetchDoctors = async (
        from: number = 0,
        amount: number = this.amountDoctorsOnOnePage,
        needFilter: boolean = false
    ): Promise<DoctorType[]> => {
        const filter: string | undefined = needFilter
            ? this.getFilter(from, amount)
            : undefined;

        const data = await axios
            .get(
                process.env.SERVER_URL +
                `/api/doctors?type=tile${filter}`
            )
            .then((data) => data.data)
            .catch((e) => {
                console.log(e);
                return {
                    success: false,
                };
            });


        console.log(data);

        if (!data.success) {
            this.openBadge();
        }

        return data.doctors ?? [];
    };

    private _updateQueryParams = () => {
        let path = "";
        if (this.name.length > 0) path += `&fullName=${this.name}`;
        if (this.specialities.length > 0) path += `&specialities=${this.specialities.join(",")}`;
        if (this.child.length > 0) path += `&child=${this.child.join(",")}`;
        if (this.workExperience.length > 0) path += `&workExperience=${this.workExperience.join(",")}`;
        if (this.qualification.length > 0) path += `&qualification=${this.qualification.join(",")}`;
        if (this.workPlan.length > 0) path += `&workPlan=${this.workPlan.join(",")}`;
        if (this.selectedCities.length > 0) path += `&city=${this.selectedCities.join(",")}`;
        if (this.rating.length > 0) path += `&rating=${this.rating.join(",")}`;

        if (path.length > 0) path = "?" + path.substring(1);
        const newUrl = window.location.protocol + "//" + window.location.host
            + window.location.pathname + path;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    private addOrRemoveItem = (array: any[], value: any): Array<any> => {
        const index = array.indexOf(value);
        if (index !== -1) {
            array.splice(index, 1);
        } else {
            array.push(value);
        }
        this._updateQueryParams();
        return array;
    };

    @action clickOnSortBy = (value : ESortBy): void => {
        if (value != this.sortBy) {
            this._sortBy = value;
            this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
        }
    }

    @action clickOnFilter = (value: string): void => {
        this.openedFilter = value === this.openedFilter ? "" : value;
    };

    @action clickOnSpecialityFilter = (value: string): void => {
        this.specialities = this.addOrRemoveItem(this.specialities, value);
        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };

    @action clickOnWorkExperienceFilter = (value: string): void => {
        this.workExperience = this.addOrRemoveItem(this.workExperience, value);
        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };

    @action clickOnRating = (value: number): void => {
        this.rating = this.addOrRemoveItem(this.rating, value);
        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };

    @action typeCity = (value: string): void => {
        jsonp(
            `https://kladr-api.ru/api.php?query=${value}&contentType=city&limit=11`,
            undefined,
            (err: any, data: any) => {
                if (!err) {
                    const cities = data.result.splice(1, 10);
                    this.queryCities = cities.map((e: any) => e.name);
                }
            }
        );
    };

    @action addCity = (i: number): void => {
        if (!this.selectedCities.includes(this.queryCities[i])) {
            this.selectedCities.push(this.queryCities[i]);
            this._updateQueryParams();
        }
    };

    @action removeCity = (i: number): void => {
        this.selectedCities.splice(i, 1);
        this._updateQueryParams();
    };

    @action onModalSubmit = (): void => {
        this.isSelectCityModalOpen = false;
        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };

    @action clickOnWorkPlan = (value: string): void => {
        this.workPlan = this.addOrRemoveItem(this.workPlan, value);
        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };
    @action clickOnChild = (value: string): void => {
        this.child = this.addOrRemoveItem(this.child, value);
        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };

    @action clickOnQualification = (value: string): void => {
        this.qualification = this.addOrRemoveItem(this.qualification, value);
        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };

    @action clearFilter = (): void => {
        this.specialities = [];
        this.workExperience = [];
        this.rating = [];
        this.selectedCities = [];
        this.workPlan = [];
        this.child = [];
    };

    @action clickOnDownward = (): void => {
        this.isDownward = !this.isDownward;
        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };

    @action onNameChange = async (value: string): Promise<void> => {
        this.name = value;

        // this's the mechanism for delayed response
        // execute 1 fetch while all name is written except a lot of after every letter of the name changed
        const ok = await new Promise<boolean>(resolve => {
           setTimeout(() => resolve(this.name === value), 300);
        });
        if (!ok) return;

        this._fetchDoctors(0, 50, true).then((docs) => (this.doctors = docs));
    };

    get sortBy(): string {
        if (this._sortBy == ESortBy.rating) return "Рейтингу";
        else return "Опыту работы";
    }

    private openBadge = () => {
        this.isErrorBadgeOpen = true;
        setTimeout(() => {
            this.isErrorBadgeOpen = false;
        }, 5000);
    };
}



