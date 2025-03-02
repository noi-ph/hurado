import classNames from "classnames";
import Link from "next/link";
import { ComponentType, DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { getPath, Path } from "client/paths";
import FreeSVG from 'assets/icons/free.svg';
import FastSVG from 'assets/icons/fast.svg';
import ChallengeSVG from 'assets/icons/challenge.svg';
import CreativeSVG from 'assets/icons/creative.svg';
import DOSTSEI from 'assets/images/dost-sei.png'
import { Navbar } from "../navbar";
import { Footer } from "../footer";
import styles from "./homepage.module.css";
import { FaqAnswer, FaqItem, FaqQuestion } from "./homepage_faq";


const HeroBanner = () => {
  return (
    <div className={classNames(styles.hero, "text-center py-32 px-6")}>
      <h1 className="text-6xl lg:text-9xl font-semibold">
        Hurado
      </h1>
      <p className="text-4xl lg:text-5xl mt-4">
        NOI.PH Online Judge
      </p>
      <p className="text-2xl lg:text-3xl mt-4 mb-8 lg:mb-12">
        The best way to learn math and coding
      </p>
      <Link
        href={getPath({ kind: Path.AccountRegister })}
        className="bg-blue-400 hover:bg-blue-500 text-white text-2xl lg:text-3xl font-semibold py-4 px-8 rounded-full"
      >
        Join us
      </Link>
    </div>
  );
};

type FeatureItemProps = {
  Icon: ComponentType<DetailedHTMLProps<HTMLAttributes<SVGSVGElement>, SVGSVGElement>>;
  title: string;
  children: ReactNode;
};

const FeatureItem = ({ Icon, title, children }: FeatureItemProps) => {
  return (
    <div className="flex-1 text-center mb-4">
      <Icon className="w-[96px] h-[96px] text-white opacity-85 mx-auto"/>
      <div className="text-white text-2xl mt-3">
        {title}
      </div>
      <div className="text-white text-md font-light mt-1">
        {children}
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <div className="bg-blue-450 px-6 pt-10 pb-6">
      <div className="max-w-[64rem] mx-auto">
        <h2 className="text-white text-4xl font-semibold text-center mb-4">
          {/* eslint-disable-next-line react/no-unescaped-entities -- pre-existing error before eslint inclusion */}
          What's in Hurado?
        </h2>
        <div className="flex flex-col gap-4 justify-center lg:flex-row lg:justify-around mx-12">
          <FeatureItem Icon={FreeSVG} title="Free">
            Completely free to train&nbsp;and&nbsp;improve
          </FeatureItem>
          <FeatureItem Icon={FastSVG} title="Instant">
            Instantaneous and automatic&nbsp;feedback
          </FeatureItem>
          <FeatureItem Icon={ChallengeSVG} title="Challenging">
            Problems designed to make&nbsp;you&nbsp;think
          </FeatureItem>
          <FeatureItem Icon={CreativeSVG} title="Creative">
            Invent your own unique&nbsp;solutions
          </FeatureItem>
        </div>
      </div>
    </div>
  );
};

const Faqs = () => {
  return (
    <div className="bg-blue-300 px-6 pt-10 pb-6">
      <div className="max-w-[64rem] mx-auto">
        <h2 className="text-white text-4xl font-semibold text-center mb-4">
          FAQ
        </h2>
        <div className="">
          <FaqItem>
            <FaqQuestion>
              {/* eslint-disable-next-line react/no-unescaped-entities -- pre-existing error before eslint inclusion */}
              What is an "online judge"?
            </FaqQuestion>
            <FaqAnswer>
              An online judge is a system that allows you to submit programs and have them automatically checked for correctness.
            </FaqAnswer>
          </FaqItem>
          <FaqItem>
            <FaqQuestion>
              Why would anyone want to do this?
            </FaqQuestion>
            <FaqAnswer>
              {/* eslint-disable-next-line react/no-unescaped-entities -- pre-existing error before eslint inclusion */}
              It's fun! And educational!
            </FaqAnswer>
          </FaqItem>
          <FaqItem>
            <FaqQuestion>
              Is it free?
            </FaqQuestion>
            <FaqAnswer>
              Yes, it is free!
            </FaqAnswer>
          </FaqItem>
        </div>
      </div>
    </div>
  );
};

const Tutorial = () => {
  return (
    <div className="bg-blue-450 px-6 py-10">
      <div className="max-w-[64rem] mx-auto">
        <h2 className="text-white text-4xl font-semibold text-center mb-4">
          Tutorial
        </h2>
        <div className="text-white text-center">
          Completely lost on how to read the problems? Check out this <a href="https://noi.ph/tutorial" target="_blank" className="font-bold hover:opacity-80">tutorial</a> made by our AlumNOI!
        </div>
      </div>
    </div>
  );
};


type SponsorItemProps = {
  name: string;
  logo: string;
};

const SponsorItem = ({ name, logo }: SponsorItemProps) => {
  return (
    <div className="flex flex-col items-center mb-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-existing error before eslint inclusion */}
      <img src={logo} alt={`${name} logo`} className="w-32 h-32 mb-4"/>
      <div className="text-black text-xl font-semibold">
        {name}
      </div>
    </div>
  );
}

const Sponsors = () => {
  return (
    <div className="bg-white px-6 pt-10 pb-6">
      <div className="max-w-[64rem] mx-auto">
        <h2 className="text-black text-4xl font-semibold text-center mb-6">
          Sponsored By
        </h2>
        <div className="flex flex-col justify-center lg:flex-row lg:justify-around mx-12">
          <SponsorItem name="DOST SEI" logo={DOSTSEI.src}/>
        </div>
      </div>
    </div>
  );
};


export const Homepage = () => {
  return (
    <div>
      <Navbar />
      <main>
        <HeroBanner/>
        <Features/>
        <Faqs/>
        <Tutorial/>
        <Sponsors/>
      </main>
      <Footer />
    </div>
  );
};
