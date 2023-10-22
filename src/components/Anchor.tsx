export const Anchor = ({ url }: { url: string }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{ cursor: "pointer" }}
    >
      {url}
    </a>
  );
};
