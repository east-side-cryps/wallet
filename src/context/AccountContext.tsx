import React, {useContext, useState} from "react";

interface IAccountContext {
    accountPassword: string | undefined,
    setAccountPassword: React.Dispatch<React.SetStateAction<string | undefined>>,
    accountDecripted: boolean,
    setAccountDecripted: React.Dispatch<React.SetStateAction<boolean>>,
}

export const AccountContext = React.createContext({} as IAccountContext)

export const AccountContextProvider: React.FC = ({ children }) => {
    const [accountPassword, setAccountPassword] = useState<string | undefined>(undefined)
    const [accountDecripted, setAccountDecripted] = useState(false)

    const contextValue: IAccountContext = {
        accountPassword,
        setAccountPassword,
        accountDecripted,
        setAccountDecripted,
    }

    return (
        <AccountContext.Provider value={contextValue}>{children}</AccountContext.Provider>
    );
}

export const useAccountContext = () => useContext(AccountContext)