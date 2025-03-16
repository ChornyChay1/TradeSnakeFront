import React from "react";
import "../../css/profile/profile.css";
// @ts-ignore
import progress_fall from "../../img/progress-fall.svg";
// @ts-ignore
import progress_up from "../../img/progress-up.svg";
// @ts-ignore
import progress_zero from "../../img/progres-zero.svg";

interface ProgressImageProps {
    percentage: number;
}

const ProgressImage: React.FC<ProgressImageProps> = ({ percentage }) => {
    let imageSrc = percentage >= 0 ? progress_up : progress_fall;
    let altText = percentage >= 0 ? "Positive" : "Negative";
    let textColor = percentage >= 0 ? "#00CA73" : "#E51A32";

    if (percentage === 0) {
        imageSrc = progress_zero;
        altText = "Zero";
        textColor = "#ffffff";
    }

    return (
        <div className="progress-image-container">
            <img src={imageSrc} alt={altText} />
            <p style={{ color: textColor }} className="balance-animation">
                {percentage.toFixed(2)}%
            </p>
        </div>
    );
};

export default ProgressImage;
