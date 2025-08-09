import React from "react";
import Link from "next/link";
import styles from "./navbar.module.css";

const Navbar: React.FC = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link href="/" className={styles.logo}>
                    Sector Screener
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/" className={styles.navLink}>
                        Sector Comparison
                    </Link>
                    <Link href="/sectors" className={styles.navLink}>
                        All Sectors
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
