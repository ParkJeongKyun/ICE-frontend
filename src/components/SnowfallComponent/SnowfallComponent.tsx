import React from "react";
import Snowfall from "react-snowfall";

interface Props {
  snowflakeCount: number;
}

const SnowfallComponent: React.FC<Props> = ({ snowflakeCount }) => {
  return (
    <Snowfall
      snowflakeCount={snowflakeCount}
      radius={[0.3, 0.5]}
      speed={[0.3, 0.5]}
    />
  );
};

export default SnowfallComponent;
