export const CopyIcon = ({ copied }: { copied: boolean }) =>
  copied ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-green-600 transition-colors duration-150"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.3 7.7-5 5a1 1 0 0 1-1.4 0l-2-2 1.4-1.4 1.3 1.3 4.3-4.3 1.4 1.4Z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-gray-600 transition-colors duration-150 group-hover:text-emerald-600"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M8 7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V7Zm-4 4a2 2 0 0 1 2-2h2v2H6v6h6v2H6a2 2 0 0 1-2-2v-6Z"
      />
    </svg>
  );
