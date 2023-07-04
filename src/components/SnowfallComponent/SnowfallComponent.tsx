import React from "react";
import Snowfall from "react-snowfall";

const SnowfallComponent: React.FC = () => {
  return (
    <Snowfall snowflakeCount={150} radius={[0.3, 0.5]} speed={[0.3, 0.5]} />
  );
};

export default SnowfallComponent;
