import React from "react";

const Background = () => {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-px " />
        <div className="absolute -top-50 left-1/2 -translate-x-1/2 w-200 h-100  blur-[120px] rounded-full" />
        <div className="absolute bottom-12 left-10 w-72 h-72  blur-[80px] rounded-full" />
        <div className="absolute bottom-20 right-10 w-80 h-80  rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370b_1px,transparent_1px),linear-gradient(to_bottom,#1f29370b_1px,transparent_1px)] bg-size-[4rem_4rem]" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-87.5 w-150 sm:w-225 bg-linear-to-tr from-teal-300/15 via-sky-300/20 to-indigo-300/15 blur-[130px] rounded-full" />

        <div className="absolute top-[2%] -left-24 h-100 w-100 bg-teal-500/50 blur-[130px] rounded-full" />

        <div className="absolute top-[12%] -right-24 h-105 w-105 bg-sky-500/50  blur-[140px] rounded-full" />

        <div className="absolute top-[25%] -left-24 h-100 w-100 bg-cyan-500/50  blur-[130px] rounded-full" />

        <div className="absolute top-[38%] -right-24 h-112.5 w-112.5 bg-blue-500/50  blur-[140px] rounded-full" />

        <div className="absolute top-[50%] -left-24 h-100 w-100 bg-teal-500/50  blur-[130px] rounded-full" />

        <div className="absolute top-[63%] -right-24 h-105 w-105 bg-sky-500/50  blur-[140px] rounded-full" />

        <div className="absolute top-[76%] -left-24 h-100 w-100 bg-cyan-500/50  blur-[130px] rounded-full" />

        <div className="absolute top-[88%] -right-24 h-100 w-100 bg-teal-500/50  blur-[130px] rounded-full" />
      </div>
    </>
  );
};

export default Background;
