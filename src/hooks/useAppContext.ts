import { createContext, useContext, useState, ReactNode } from 'react';

// Placeholder User type
export interface User {
  id: string;
  name: string;
  email: string;
}

interface AppContextType {
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        onboardingCompleted,
        setOnboardingCompleted,
        currentUser,
        setCurrentUser,
        selectedImages,
        setSelectedImages,
        activeModal,
        setActiveModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
