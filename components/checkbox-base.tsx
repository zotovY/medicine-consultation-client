import React from "react";


type Props = {
    for?: string;
    checked: boolean;
    onChange: () => void;
    dataTest?: string;
}

const CheckboxBase: React.FC<Props> = (props: Props) => {
    return <div className="checkbox" >
        <input className="inp-cbx"
               id="cbx"
               type="checkbox"
               data-test={props.dataTest}
               checked={props.checked}
               onChange={props.onChange}
               />
        <label className="cbx" htmlFor={props.for ?? "cbx"}>
            <span>
                <svg
                    width="12px" height="10px" viewBox="0 0 12 10">
                    <polyline
                        points="1.5 6 4.5 9 10.5 1">
                    </polyline>
                </svg>
            </span>
        </label>
    </div>
}

export default CheckboxBase;
