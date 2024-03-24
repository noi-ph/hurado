import type { Task } from '@models'

import { MDXRemote, compileMDX } from 'next-mdx-remote/rsc'

import styles from './page.module.css'

export async function generateStaticParams() {
    try {
        const response = await fetch('/api/v1/tasks')
        const tasks = await response.json()

        return tasks.map((task: Task) => ({
            params: { slug: task.title },
        }))
    } catch (error) {}

    return []
}

type props = {
    params: {
        slug: string
    }
}

async function generateStaticProps(slug: string) {
    const response = await fetch(
        `${ process.env.SERVER! }/api/v1/tasks/${ slug }`
    )

    const task = await response.json()

    return {
        title: task.title,
        description: task.description ?? '',
        statement: task.statement,
    }
}

async function Page({ params }: props) {
    const {
        title,
        description,
        statement,
    } = await generateStaticProps(params.slug)

    return (
        <div className={ styles.task }>
            <h1>{ title }</h1>
            <p>{ description }</p>
            <MDXRemote source={ `${statement}` } />
        </div>
    )
}

export default Page
