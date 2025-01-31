import * as React from "react";

import { NavigationMenu } from "radix-ui";

const NavigationMenuDemo = () => {
  return (
    <NavigationMenu.Root className=" z-10 flex w-screen justify-center relative top-5">
      <NavigationMenu.List className="center m-0 flex list-none rounded-md bg-white p-1 shadow-[0_2px_10px] shadow-blackA4">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="group flex select-none items-center justify-between gap-0.5 rounded px-3 py-2 text-[15px] font-medium leading-none text-violet11 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-violet7">
            Test1{" "}
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="absolute left-0 top-0 w-full data-[motion=from-end]:animate-enterFromRight data-[motion=from-start]:animate-enterFromLeft data-[motion=to-end]:animate-exitToRight data-[motion=to-start]:animate-exitToLeft sm:w-auto">
            <a href="/">Test items-valid-inside-header-menu</a>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="group flex select-none items-center justify-between gap-0.5 rounded px-3 py-2 text-[15px] font-medium leading-none text-violet11 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-violet7">
            Test2{" "}
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="absolute left-0 top-0 w-full sm:w-auto">
            <a href="/Invalid link inside header menu">Invalid link inside header menu</a>
          </NavigationMenu.Content>
        </NavigationMenu.Item>



        <NavigationMenu.Indicator className="top-full z-10 flex h-2.5 items-end justify-center overflow-hidden transition-[width,transform_250ms_ease] data-[state=hidden]:animate-fadeOut data-[state=visible]:animate-fadeIn">
          <div className="relative top-[70%] size-2.5 rotate-45 rounded-tl-sm bg-white" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className="perspective-[2000px] absolute left-0 top-full flex w-full justify-center">
        <NavigationMenu.Viewport className="relative mt-2.5 h-[var(--radix-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-md bg-white transition-[width,_height] duration-300 data-[state=closed]:animate-scaleOut data-[state=open]:animate-scaleIn sm:w-[var(--radix-navigation-menu-viewport-width)]" />
      </div>
    </NavigationMenu.Root>
  );
};

export default function Test() {
  return (
    <div className="flex flex-col gap-14">
      <NavigationMenuDemo />
      <div className="flex flex-col">
        <div>
          This page is created for testing the open crawler testing purposes
        </div>

        <div>
          {" "}
          <a href="/">This is valid link</a>
          <a href="/adfdhkjfdahkfjadhjfkahjfadnf-1">This is invalid link link</a>
          <a href="/adfdhkjfdahkfjadhjfkahjfadnf-2 ">This is invalid link link</a>
          <a href="/adfdhkjfdahkfjadhjfkahjfadnf-3">This is invalid link link</a>
          <a href="/adfdhkjfdahkfjadhjfkahjfadnf-4">This is invalid link link</a>
          <a href="/adfdhkjfdahkfjadhjfkahjfadnf-5">This is invalid link link</a>
          <a href="/dupe">dupe</a>
          <a href="/dupe">dupe</a>
        </div>
      </div>
    </div>
  );
}
