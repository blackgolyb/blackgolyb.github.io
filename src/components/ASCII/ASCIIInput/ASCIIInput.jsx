import React, { forwardRef } from "react";

import withASCII from "../withASCII/withASCII";

const ASCIIInput = withASCII(forwardRef((props, ref) => <input ref={ref} {...props} />));

export default ASCIIInput;
