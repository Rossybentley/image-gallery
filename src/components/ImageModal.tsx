import "../styles/ImageModal.css";

type Props = {
  image: {
    url: string;
    alt: string;
  } | null;

  onClose: () => void;
};

function ImageModal({ image, onClose }: Props) {
  if (!image) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <img src={image.url} alt={image.alt} className="modal-image" />
    </div>
  );
}

export default ImageModal;
