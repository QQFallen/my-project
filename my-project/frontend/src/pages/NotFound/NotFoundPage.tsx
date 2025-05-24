import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.scss";
import notFoundImage from "../../assets/404.svg";

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <img src={notFoundImage} alt="404 Error" className={styles.image} />
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.text}>
        Извините, но страница, которую вы ищете, не существует или была
        перемещена. Пожалуйста, проверьте правильность введенного адреса или
        вернитесь на главную страницу.
      </p>
      <Link to="/" className={styles.link}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;
