import {
  LuCreditCard,
  LuHeadphones,
  LuHeadset,
  LuLaptop,
  LuShieldCheck,
  LuSmartphone,
  LuTablet,
  LuTruck,
  LuWatch,
} from "react-icons/lu";
import {
  SiApple,
  SiHuawei,
  SiJbl,
  SiLenovo,
  SiSamsung,
  SiSony,
  SiXiaomi,
} from "react-icons/si";

// Icons the homepage editor can pick, by the name stored in the content.
export const lineIcons = {
  LuSmartphone,
  LuWatch,
  LuHeadphones,
  LuTablet,
  LuLaptop,
  LuTruck,
  LuShieldCheck,
  LuCreditCard,
  LuHeadset,
};

export const brandIcons = {
  SiApple,
  SiSamsung,
  SiXiaomi,
  SiSony,
  SiJbl,
  SiHuawei,
  SiLenovo,
};

export const homeIcons = { ...lineIcons, ...brandIcons };
