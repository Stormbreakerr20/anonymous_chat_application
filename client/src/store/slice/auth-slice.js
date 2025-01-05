const getInitialUserInfo = () => {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
};

export const createAuthSlice = (set) => ({
    userInfo: getInitialUserInfo(),
    setUserInfo: (userInfo) => {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        set({ userInfo });
    },
    clearUserInfo: () => {
        localStorage.removeItem('userInfo');
        set({ userInfo: null });
    }
});