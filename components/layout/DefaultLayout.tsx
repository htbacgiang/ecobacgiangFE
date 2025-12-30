import { FC, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Footer from '../common/Footer';
import Navbar from '../header/Navbar';
import NavbarMobile from './NavbarMobile';

const GoogleAnalytics = dynamic(() => import('../common/GoogleAnalytics'), { ssr: false });
const ChatWidget = dynamic(() => import('../chat/ChatWidget'), { ssr: false });

interface Props {
  title?: string;
  desc?: string;
  thumbnail?: string;
  meta?: any;
  children: ReactNode;
}

const DefaultLayout: FC<Props> = ({ title, desc, thumbnail, meta, children }): JSX.Element => {
  return (
    <>
      <div className="min-h-screen bg-primary dark:bg-primary-dark transition">
        <Navbar />
        <GoogleAnalytics />
        <div className="mx-auto max-w-full">{children}</div>
        <Footer />
        <NavbarMobile />
        <ChatWidget />
      </div>
    </>
  );
};

export default DefaultLayout;