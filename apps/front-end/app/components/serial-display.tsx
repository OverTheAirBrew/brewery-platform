import { FC } from "react";

export const SerialDisplay: FC<{serial:string}> = ({serial}) => {
  return (
    <div className="bg-black text-white p-3 text-2xl font-code">
    {serial}
  </div>
  )
}