import type { Task } from '@models'

import { Fragment } from 'react'

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
    try {
        // generateStaticProps does not resolve the server URL
        const response = await fetch(
            `${ process.env.SERVER! }/api/v1/tasks/${ slug }`
        )
        const task = await response.json()

        return {
            title: task.title,
            description: task.description ?? '',
            statement: task.statement,
        }
    } catch (error) {
        console.log(error)
    }

    return {}
}

async function Page({ params: { slug } }: props) {
    const { title, description, statement } = await generateStaticProps(slug)

    return (
        <Fragment>
            <h1>{ title }</h1>
            <p>{ description }</p>
            <p>{ statement }</p>
        </Fragment>
    )
}

export default Page
