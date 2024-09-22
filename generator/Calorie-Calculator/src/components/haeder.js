import React from 'react';
import Head from 'next/head';

const CustomHead = () => {
    const siteTitle = 'AI Calorie Calculator | Food Recognition';

    const description = 'Utilize AI technology to recognize food images and generate calorie statistics, helping you better manage your dietary health.';
    const pageImage = '';
    const keywords = 'AI, food recognition, calorie counting, calorie statistics, Calorie Calculator, AI Calorie Calculator, Do Calorie Calculator';


    return (
        <Head>
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={siteTitle} />
            <meta name="twitter:title" content={siteTitle} />
            <meta itemProp="name" content={siteTitle} />
            <link rel="apple-touch-icon" sizes="320x320" href="/favicon.ico" />
            <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
            <meta name="keywords" content={keywords} />
            <meta name="application-name" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={siteTitle} />
            <meta property="og:url" content="" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:image" content={pageImage} />
            <meta property="og:image:secure_url" content={pageImage} />
            <meta property="og:type" content="website" />
        </Head>
    );
};

export const Header = () => {
    return (
        <div>
            <CustomHead />

            <header style={{ maxWidth: '1500px',maxHeight: '80px' }} className="navbar navbar-expand-lg navbar-light bg-light shadow">
                <div className="container">
                    {/* Logo Section */}
                    <div className="navbar-brand">
                    <img src="/health.svg" alt="Logo" style={{ height: '80px', width: '80px' }} />
                        <span className="text-xl font-weight-bold">Calorie Calculator</span>
                    </div>
                </div>
            </header>
        </div>
    );
};