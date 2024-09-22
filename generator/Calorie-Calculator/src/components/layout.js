import { Footer } from "@/components/footer";
import { Header } from "@/components/haeder";

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <main className="container-fluid flex-grow-1 p-5 bg-gradient bg-gradient-to-b from-gray-100 to-blue-gray-500 pb-6 pt-8">
                {children}
            </main>
            <Footer />
        </>
    );
};

export default Layout;
