import React from "react";
import { useRouter } from "next/router";
import Layout from "../../../src/components/layout/layout";
import SectorDetailPage from "../../../src/components/sector-detail-page/sector-detail-page";

const SectorPage: React.FC = () => {
    const router = useRouter();
    const { sector } = router.query;

    if (!sector || typeof sector !== "string") {
        return (
            <Layout>
                <div style={{ padding: "2rem", textAlign: "center" }}>
                    <h1>Invalid Sector</h1>
                    <p>Please provide a valid sector name.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ padding: "2rem" }}>
                <SectorDetailPage sectorName={sector} />
            </div>
        </Layout>
    );
};

export default SectorPage;
