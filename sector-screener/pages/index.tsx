import React from "react";
import Layout from "../src/components/layout/layout";
import SectorComparisonPage from "../src/components/sector-comparison-page/sector-comparison-page";

export default function Home() {
    return (
        <Layout>
            <div style={{ padding: "2rem" }}>
                <SectorComparisonPage />
            </div>
        </Layout>
    );
}
