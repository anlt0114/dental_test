import React, { useState } from "react";
import { useStep } from "./hooks/useStep";
import AudioPlayer from "./AudioPlayer";

type RowData = {
  key: number;
  value: string[];
};

const headers = [
  { icon: "", label: "Tran E/I" },
  { icon: "", label: "Tran B/L" },
  { icon: "", label: "Tran M/D" },
  { icon: "", label: "Rot M/D" },
  { icon: "", label: "Ang M/D" },
  { icon: "", label: "Torq B/L" },
];

const degreeColumns = new Set(["Rot M/D", "Ang M/D", "Torq B/L"]);
const rowIndexes = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 38, 37, 36,
  35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48,
];

export default function TreatmentTable() {
  const { getMaxStepInputs } = useStep();
  const [data, setData] = useState<RowData[]>(
    rowIndexes.map((key) => ({
      key,
      value: headers.map((header) =>
        degreeColumns.has(header.label) ? "0°" : "0"
      ),
    }))
  );

  console.log("data===", { data, rowIndexes });

  const formatDegreeInput = (value: string): string => {
    const cleaned = value.replace(/[^\d.-]/g, "");
    return cleaned ? `${cleaned}°` : "";
  };

  const getMaxValue = (header: string): number => {
    if (["Tran E/I", "Tran B/L", "Tran M/D"].includes(header)) return 6;
    if (["Rot M/D", "Ang M/D", "Torq B/L"].includes(header)) return 46;
    return Infinity;
  };

  const parseNumericValue = (value: string): number => {
    const cleaned = value.replace(/[^\d.]/g, "");
    return parseFloat(cleaned);
  };

  const handleChange = (rowKey: number, colIndex: number, newValue: string) => {
    const header = headers[colIndex];
    const isDegree = degreeColumns.has(header.label);
    const max = getMaxValue(header.label);

    const numeric = parseNumericValue(newValue);

    if (!isNaN(numeric) && numeric < max) {
      const formatted = isDegree ? `${numeric}°` : `${numeric}`;
      setData((prevData) =>
        prevData.map((row) =>
          row.key === rowKey
            ? {
                ...row,
                value: row.value.map((v, i) =>
                  i === colIndex ? formatted : v
                ),
              }
            : row
        )
      );
    } else if (newValue === "") {
      setData((prevData) =>
        prevData.map((row) =>
          row.key === rowKey
            ? {
                ...row,
                value: row.value.map((v, i) => (i === colIndex ? "" : v)),
              }
            : row
        )
      );
    }
  };

  return (
    <div className="overflow-auto max-h-[80vh] p-4 border rounded">
      <table className="border-collapse min-w-full text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white border px-2 w-12 text-center"></th>
            {headers.map((header, i) => (
              <th
                key={i}
                className="border w-24 text-gray-700 text-xs whitespace-nowrap"
              >
                {/* <img src="/" /> */}
                <div className="transform  origin-bottom h-24 flex items-end justify-center">
                  {header.label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(({ key, value }) => (
            <tr key={key}>
              <td className="sticky left-0 z-10 bg-white border text-center font-medium text-gray-600">
                {key}
              </td>
              {value.map((cell, colIndex) => (
                <td key={colIndex} className="border text-center px-1">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) =>
                      handleChange(key, colIndex, e.target.value)
                    }
                    className="w-full text-center outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <AudioPlayer
        totalStep={getMaxStepInputs(
          data.map((row) => {
            return {
              key: row.key,
              value: row.value.map((v) => parseNumericValue(v)),
            };
          })
        )}
      />
    </div>
  );
}
