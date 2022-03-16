import styles from './header.module.scss'


export const Header =( )=>{
    return(
        <header className={styles.headerContainer}>
            <div className={styles.content}>
             <img className={styles.image} src='image/Logo.svg' alt="Logo" />
            </div>
        </header>
    )
}
