import React from "react";
import "./styles.scss";
import Error from "./components/hub-error";
import PatientСard from "./components/patient-card"
import RequestIndicator from "./components/request-indicator"

const Hub: React.FC = () => {
    const showError: boolean = false;
    return(
        <>
            {
                !showError 
                    ? 
                        <>
                            <div className="hub-wrapper">
                                <div className="hub-wrapper__patient-card left-side">
                                    <PatientСard    name='Василий' 
                                                    surname="Иванов" 
                                                    number="+7 (932) 33-27-350" 
                                                    sex="Мужской" chronicDiseases="" 
                                                    symptoms="Всё оч плохо ноги нет. Я не знаю что мне делать. Мне кажется я скоро умру, если вы мне не поможете" 
                                                    imgUrl=""
                                                    middlename="Иванович"
                                                    date="2020-12-28T07:39:06.265Z"
                                                    age= {1}
                                                    fullname="Василий Иванов Иванович"
                                                    id="AVCX21314DC"
                                    />
                                </div>
                                <div className="hub-wrapper__sidebar right-side">
                                    <RequestIndicator numberRequest={1} />
                                </div>
                            </div>

                        </>
                    : 
                        <Error/>
            }    
        </>     
    )
} 

export default Hub;