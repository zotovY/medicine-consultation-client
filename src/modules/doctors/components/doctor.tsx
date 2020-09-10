import React from "react";
import Skeleton from 'react-loading-skeleton';
import RatingComponent from "./rating";
import { useHistory } from "react-router-dom";
import detailController from "../controllers/detail-controller";
import controller from "../controllers/find-doctor-controller";

type Props = {
    name: string;
    surname: string;
    speciality: string;
    age?: number;
    imgUrl: string;
    rating: number;
    id: string;
};

const Doctor: React.FC<Props> = (props: Props) => {

    const img = "https://www.epos-ural.ru/wp-content/uploads/2019/03/user-placeholder.jpg" ?? props.imgUrl;
    const history = useHistory();

    const goToDoctorPage = (): void => {
        detailController.fetchDoctor(props.id);
        history.push(`/doctor/${props.id}`);
    }

    if (controller.isLoading) {
        return <div className="doctor">
            <Skeleton style={{ marginRight: "10px" }} width={100} height={100} />
            <div className="info">
                <Skeleton style={{ display: "block", marginBottom: "5px" }} width={175} height={16} />
                <Skeleton style={{ display: "block" }} width={100} height={14} />
                <div className="rating">
                    <RatingComponent amount={props.rating} />
                </div>
            </div>
        </div>
    }

    return <div className="doctor" onClick={goToDoctorPage}>
        <div className="image" style={{ backgroundImage: `url(${img})` }}></div>
        <div className="info">
            <h3>{props.name}&nbsp;{props.surname}</h3>

            {
                //todo: bugfix -  21 лет
                props.age || props.speciality ? <span className="speciality-and-age">{props.speciality ? props.speciality + ", " : ""}{props.age ? props.age + " лет" : ""}</span> : <React.Fragment />
            }

            <div className="rating">
                <RatingComponent amount={props.rating} />
            </div>
        </div>
    </div>
}

export default Doctor;