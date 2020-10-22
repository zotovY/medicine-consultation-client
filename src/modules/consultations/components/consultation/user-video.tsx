import React, { useEffect, useRef } from 'react';
import { observer } from "mobx-react";
import { CloseIcon } from '../../../doctors/icons';
import controller from "../../controller/consultation-controller";
import { MicroSlashIcon } from '../../icons';

const UserVideo: React.FC = () => {

    const partnerVideo = useRef<HTMLVideoElement>(null);
    const styles = controller.partnerImagePath ? { backgroundImage: `url(${controller.partnerImagePath})` } : {};

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (partnerVideo.current) {
                    partnerVideo.current.srcObject = stream;
                }
            })
            .catch(() => null)
    }, []);

    return <div className="user">
        <div className="user-wrapper">
            <video playsInline autoPlay muted={controller.partnerMicroStatus ? false : true} id="user-video" className={controller.isMinimized ? "hidden" : ""} />

            {
                !controller.isMinimized
                    ? <React.Fragment>
                        <div className="close" onClick={() => controller.isMinimized = true}>
                            <CloseIcon />
                        </div>
                        {
                            !controller.partnerMicroStatus
                                ? <div className="micro">
                                    <MicroSlashIcon />
                                </div>
                                : <React.Fragment />
                        }
                    </React.Fragment>
                    : <div className="minimized" style={styles} onClick={() => controller.isMinimized = false}></div>
            }
        </div>
    </div>
}

export default observer(UserVideo);