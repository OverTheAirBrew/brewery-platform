import { FC, PropsWithChildren } from 'react';

export const HyperPixel2rWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="size-hyperpixel2r rounded-full border-2 flex items-center justify-center cursor-none">
      <div className="grid-rows-1 justify-items-center text-center">
        {children}
      </div>
    </div>
  );
};
