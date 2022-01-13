import MultiProgress from "react-multi-progress";
import { Tooltip } from 'primereact/tooltip';
import { Button } from "primereact/button";

const MultiProgressBar = () => {

    let complete = 1500;
    let progress = 500;
    let ignored = 20;
    let totalValue = complete + progress + ignored;
    let complateValue = (complete * 100) / totalValue;
    let progressValue = (progress * 100) / totalValue;
    let ignoredValue = 100 - (complateValue + progressValue);

    return (
        <>
            <MultiProgress
                transitionTime={1.2}
                elements={[
                    {
                        value: complateValue,
                        color: "#1CC723",
                    },
                    {
                        value: progressValue,
                        color: "#FFE700",
                    },
                    {
                        value: ignoredValue,
                        color: "#C1C7D0",
                    },
                ]}
                height={10}
            />
        </>
    )
}

export default MultiProgressBar