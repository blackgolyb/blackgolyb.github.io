import ASCIIWrapper from "./ASCIIWrapper/ASCIIWrapper";
import { Str } from "src/components/AutoInput/AutoInput";

export const TopBorder = () => {
    const { ASCIIBorders } = ASCIIWrapper.useContext();

    return <Str localePriority={1} >{ASCIIBorders[0]}</Str>;
};

export const BottomBorder = () => {
    const { ASCIIBorders } = ASCIIWrapper.useContext();

    return <Str localePriority={3}>{ASCIIBorders[1]}</Str>;
};
