import React from "react";
import { IconName } from "boxicons";
import classNames from "classnames";

interface BoxIconProps {
  name: IconName;
  className?: string;
}

const BoxIcon: React.FC<BoxIconProps> = ({ name, className }) => {
  return <i className={classNames("bx", name, className)} />;
};

export default BoxIcon;
