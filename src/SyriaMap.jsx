import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import syria from "./syria.json";

export default function SyriaMap({ provinces = [], onSelect }) {
  const activeProvinceNames = provinces.map(p => p.name.trim());

  return (
    <div style={{ width: "100%", height: "50vh" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [39, 34.8], scale: 3500 }}
        style={{ width: "100%", height: "120%" }}
      >
        <Geographies geography={syria}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.NAME_ARA.trim();
              const isActive = activeProvinceNames.includes(name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => isActive && onSelect(name)}
                  style={{
                    default: {
                      fill: isActive ? "#D6D6DA" : "#f0f0f0",
                      stroke: "#607D8B",
                      strokeWidth: 0.75,
                      outline: "none",
                    },
                    hover: {
                      fill: isActive ? "#F53" : "#ccc",
                      outline: "none",
                      cursor: isActive ? "pointer" : "default",
                    },
                    pressed: {
                      fill: "#E42",
                      outline: "none",
                    },
                  }}
                >
                  <title>{name}</title>
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
