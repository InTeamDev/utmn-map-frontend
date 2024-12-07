import React from 'react';
import styles from './ImageCard.module.css';

interface ImageCardProps {
  src: string;
  alt: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, alt }) => {
  return (
    <div className={styles.imageWrapper}>
      <img className={styles.image} src={src} alt={alt} />
    </div>
  );
};

export default ImageCard;
