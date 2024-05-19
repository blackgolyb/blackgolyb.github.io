import React, { forwardRef } from "react";

import withASCII from "../withASCII/withASCII";

const ASCIITextArea = withASCII(
    forwardRef((props, ref) => <textarea ref={ref} {...props} />)
);

export default ASCIITextArea;
