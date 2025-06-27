import LoadingSpinner from "./LoadingSpinner";

interface FullPageLoaderProps {
  isLoading: boolean;
  message: string;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  isLoading,
  message,
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-4 text-lg font-medium text-gray-800">{message}</p>
      </div>
    </div>
  );
};

export default FullPageLoader;
