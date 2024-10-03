import React, { forwardRef } from "react";
import { AvatarUser } from "@/types/types";

const Avatar = forwardRef<HTMLImageElement, AvatarUser>(
  ({ width, height, src, alt, header, onClick }, ref) => {
    return (
      <img
        className={`cursor-pointer  ${width} ${height} p-1 rounded-full ${header ? header : ""}`}
        src={src as string}
        alt={alt}
        onClick={onClick}
        ref={ref} 
      />
    );
  }
);

export default Avatar;