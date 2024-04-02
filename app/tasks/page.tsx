'use client'

import type { FunctionComponent, ReactNode } from 'react'
import type { Task } from '@models'

import { Fragment, useEffect, useState } from 'react'

import { TaskCard } from '@components'

const Page: FunctionComponent = () => {
    const [ tasks, setTasks ] = useState<Task[]>([])

    useEffect(() => {
        (async () => {
            const response = await fetch('/api/v1/tasks')

            setTasks(await response.json())
        })()
    }, [])

    const [ taskNodes, setTaskNodes ] = useState<ReactNode[]>([])

    useEffect(() => {
        setTaskNodes(tasks.map(task => <TaskCard task={ task } />))
    }, [ tasks ])

    return (
        <Fragment>
            { ...taskNodes }
        </Fragment>
    )
}

export default Page
