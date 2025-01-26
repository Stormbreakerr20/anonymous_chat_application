import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NewDM from "..pages/chat/components/contacts-container/components/new-dm/index.jsx";
import MessagePage from "../pages/chat/components/contacts-container/components/new-dm/MessagePage.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<NewDM />} />
                <Route path="/messages/:userId" element={<MessagePage />} />
            </Routes>
        </Router>
    );
}

export default App;
