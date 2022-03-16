import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import styles from './home.module.scss';
import common from '../styles/common.module.scss';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPaginagion {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPaginagion;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState<PostPaginagion>({
    ...postsPagination,
    results: postsPagination.results.map(post => ({
      ...post,
      first_publication_date: post.first_publication_date,
    })),
  });

  async function loadMorePosts(): Promise<void> {
    const response = await fetch(`${posts.next_page}`).then(data =>
      data.json()
    );

    setPosts({
      ...posts,
      results: [...posts.results, ...response.results],
      next_page: response.next_page,
    });
  }

  return (
    <main className={common.container}>
      <div className={styles.posts}>
        {posts.results.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <strong>{post.data.title}</strong>
              <span>{post.data.subtitle}</span>
              <ul>
                <FiCalendar color="#BBBBBB" />
                <li>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </li>
                <FiUser className={styles.userIcon} color="#BBBBBB" />
                <li>{post.data.author}</li>
              </ul>
            </a>
          </Link>
        ))}
      </div>
      {posts.next_page && (
        <button
          className={styles.buttonPosts}
          type="button"
          onClick={loadMorePosts}
        >
          Carregar mais posts
        </button>
      )}
      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a className={styles.buttonExitPreview}>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination = {
    next_page: response.next_page,
    results: response.results,
  };

  return {
    props: {
      postsPagination,
      preview,
    },
  };
};
