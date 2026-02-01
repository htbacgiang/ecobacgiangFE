import { FC, ReactNode, useState } from "react";
import Head from "next/head";
import Slidebar from '../admin/layout/Slidebar';

const APP_NAME = "Eco Bắc Giang - Nông nghiệp trong suy nghĩ";

interface Props {
  children: ReactNode;
  title?: string;
}

const AdminLayout: FC<Props> = ({ title, children }): JSX.Element => {
  const [showSidebar, setShowSidebar] = useState(false);
  const pageTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="flex overflow-x-hidden admin-layout">
        <Slidebar />
        <div className={`lg:ml-60 ml-0 flex-grow bg-slate-100 min-h-screen overflow-x-hidden main-content`}>
        {/* Correctly pass setShowSidebar to Navbar */}
        <main className="p-2 bg-white dark:bg-slate-900 min-h-screen overflow-x-hidden dashboard-content">
          {children}
        </main>
      </div>
      </div>
    </>
  );
};

export default AdminLayout;
