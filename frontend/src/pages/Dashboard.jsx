import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, clearToken, getToken } from '../lib/api.js'

const Dashboard = () => {
	const [tasks, setTasks] = useState([])
	const [activity, setActivity] = useState([])
	const [selectedPriority, setSelectedPriority] = useState('medium')
	const [userName, setUserName] = useState('User')
	const [searchTerm, setSearchTerm] = useState('')
	const [searchResults, setSearchResults] = useState(null)
	const userTag = "✦ Let's crush some tasks!"
	const navigate = useNavigate()
	const [filter, setFilter] = useState('all')
	const [navView, setNavView] = useState('all')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingTaskId, setEditingTaskId] = useState(null)
	const [name, setName] = useState('')
	const [desc, setDesc] = useState('')
	const [date, setDate] = useState('')
	const [nameError, setNameError] = useState(false)
	const nameRef = useRef(null)

	const total = tasks.length
	const doneCount = tasks.filter((t) => t.done).length
	const pendingCount = total - doneCount
	const lowCount = tasks.filter((t) => t.priority === 'low').length
	const medCount = tasks.filter((t) => t.priority === 'medium').length
	const highCount = tasks.filter((t) => t.priority === 'high').length
	const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0

	const filteredTasks = useMemo(() => {
		if (searchResults) {
			return searchResults
		}

		let view = [...tasks]
		const today = new Date().toISOString().split('T')[0]

		if (filter === 'today') {
			view = tasks.filter((t) => t.date === today)
		} else if (filter === 'week') {
			const wk = new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0]
			view = tasks.filter((t) => t.date && t.date <= wk)
		} else if (['high', 'medium', 'low'].includes(filter)) {
			view = tasks.filter((t) => t.priority === filter)
		} else if (filter === 'pending') {
			view = tasks.filter((t) => !t.done)
		} else if (filter === 'completed') {
			view = tasks.filter((t) => t.done)
		}

		return view
	}, [filter, tasks, searchResults])

	useEffect(() => {
		const token = getToken()
		if (!token) {
			navigate('/login')
			return
		}

		const load = async () => {
			try {
				const [taskPayload, userPayload] = await Promise.all([
					api.getTasks(),
					api.getCurrentUser(),
				])

				const mapped = taskPayload.tasks.map((task) => ({
					id: task._id,
					name: task.title,
					desc: task.description || '',
					priority: task.priority,
					date: task.dueDate ? task.dueDate.slice(0, 10) : '',
					done: task.completed,
				}))

				setTasks(mapped)
				if (userPayload?.user?.name) {
					setUserName(userPayload.user.name)
				}
			} catch (err) {
				console.error(err)
			}
		}

		load()
	}, [navigate])

	useEffect(() => {
		if (!isModalOpen) return
		const today = new Date().toISOString().split('T')[0]
		setDate(today)
		const id = window.setTimeout(() => nameRef.current?.focus(), 60)
		return () => window.clearTimeout(id)
	}, [isModalOpen])

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				closeModal()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [])

	const openModal = () => {
		setEditingTaskId(null)
		setIsModalOpen(true)
	}

	const openEditModal = (task) => {
		setEditingTaskId(task.id)
		setName(task.name)
		setDesc(task.desc)
		setDate(task.date || '')
		setSelectedPriority(task.priority)
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setEditingTaskId(null)
		setName('')
		setDesc('')
		setNameError(false)
		setSelectedPriority('medium')
	}

	const logActivity = (text, pri) => {
		setActivity((prev) => {
			const next = [{ text, pri, at: new Date() }, ...prev]
			return next.slice(0, 12)
		})
	}

	const addTask = async () => {
		const trimmed = name.trim()
		if (!trimmed) {
			setNameError(true)
			window.setTimeout(() => setNameError(false), 900)
			nameRef.current?.focus()
			return
		}

		try {
			if (editingTaskId) {
				const payload = await api.updateTask(editingTaskId, {
					title: trimmed,
					description: desc.trim(),
					priority: selectedPriority,
					dueDate: date || null,
				})

				const updated = payload.task
				setTasks((prev) =>
					prev.map((task) =>
						task.id === editingTaskId
							? {
									...task,
									name: updated.title,
									desc: updated.description || '',
									priority: updated.priority,
									date: updated.dueDate ? updated.dueDate.slice(0, 10) : '',
								}
							: task
					)
				)
				logActivity(`\"${trimmed}\" updated`, selectedPriority)
				closeModal()
				return
			}

			const payload = await api.createTask({
				title: trimmed,
				description: desc.trim(),
				priority: selectedPriority,
				dueDate: date || null,
				completed: false,
			})

			const saved = payload.task
			const task = {
				id: saved._id,
				name: saved.title,
				desc: saved.description || '',
				priority: saved.priority,
				date: saved.dueDate ? saved.dueDate.slice(0, 10) : '',
				done: saved.completed,
			}

			setTasks((prev) => [task, ...prev])
			logActivity(`\"${trimmed}\" created`, selectedPriority)
			closeModal()
		} catch (err) {
			console.error(err)
		}
	}

	const toggleTask = async (id) => {
		const target = tasks.find((task) => task.id === id)
		if (!target) return
		const nextDone = !target.done

		try {
			const payload = await api.updateTask(id, { completed: nextDone })
			const updated = payload.task
			setTasks((prev) =>
				prev.map((task) =>
					task.id === id
						? {
								...task,
								done: updated.completed,
								name: updated.title,
								desc: updated.description || '',
								priority: updated.priority,
								date: updated.dueDate ? updated.dueDate.slice(0, 10) : '',
							}
						: task
				)
			)
			logActivity(
				`\"${target.name}\" ${nextDone ? 'completed ✓' : 'reopened'}`,
				target.priority
			)
		} catch (err) {
			console.error(err)
		}
	}

	const deleteTask = async (id) => {
		const target = tasks.find((task) => task.id === id)

		try {
			await api.deleteTask(id)
			if (target) {
				logActivity(`\"${target.name}\" removed`, 'del')
			}
			setTasks((prev) => prev.filter((task) => task.id !== id))
		} catch (err) {
			console.error(err)
		}
	}

	const formatAgo = (timestamp) => {
		const diffSeconds = Math.floor((Date.now() - timestamp.getTime()) / 1000)
		if (diffSeconds < 5) return 'now'
		if (diffSeconds < 60) return `${diffSeconds}s`
		if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`
		return `${Math.floor(diffSeconds / 3600)}h`
	}

	const activeTab = ['all', 'today', 'week', 'high', 'medium', 'low'].includes(filter)
		? filter
		: null

	useEffect(() => {
		const term = searchTerm.trim()
		if (!term) {
			setSearchResults(null)
			return undefined
		}

		const id = window.setTimeout(async () => {
			try {
				const payload = await api.searchTasks(term)
				const mapped = payload.tasks.map((task) => ({
					id: task._id,
					name: task.title,
					desc: task.description || '',
					priority: task.priority,
					date: task.dueDate ? task.dueDate.slice(0, 10) : '',
					done: task.completed,
				}))
				setSearchResults(mapped)
			} catch (err) {
				console.error(err)
			}
		}, 300)

		return () => window.clearTimeout(id)
	}, [searchTerm])

	const handleTabClick = (value) => {
		setFilter(value)
		setNavView('all')
	}

	const handleNavClick = (value) => {
		setNavView(value)
		setSearchResults(null)
		if (value === 'pending') {
			setFilter('pending')
		} else if (value === 'completed') {
			setFilter('completed')
		} else {
			setFilter('all')
		}
	}

	return (
		<div className="app">
			<aside className="sidebar">
				<div className="logo">
					<div className="logo-mark">⚡</div>
					<span className="logo-name">TaskFlow</span>
				</div>

				<div className="user-card">
					<div className="user-row">
						<div className="avatar">
							{userName
								.split(' ')
								.filter(Boolean)
								.slice(0, 2)
								.map((part) => part[0]?.toUpperCase())
								.join('') || 'U'}
						</div>
						<div className="user-meta">
							<div className="user-name">{userName}</div>
							<div className="user-tag">{userTag}</div>
						</div>
					</div>
					<div className="prod-row">
						<span>Productivity</span>
						<span id="prod-pct">{completionRate}%</span>
					</div>
					<div className="prod-track">
						<div className="prod-fill" id="prod-fill" style={{ width: `${completionRate}%` }}></div>
					</div>
				</div>

				<nav className="nav">
					<div
						className={`nav-item ${navView === 'all' ? 'active' : ''}`}
						data-view="all"
						onClick={() => handleNavClick('all')}
					>
						<span className="ni">⊞</span> Dashboard
					</div>
					<div
						className={`nav-item ${navView === 'pending' ? 'active' : ''}`}
						data-view="pending"
						onClick={() => handleNavClick('pending')}
					>
						<span className="ni">◷</span> Pending Tasks
					</div>
					<div
						className={`nav-item ${navView === 'completed' ? 'active' : ''}`}
						data-view="completed"
						onClick={() => handleNavClick('completed')}
					>
						<span className="ni">✓</span> Completed Tasks
					</div>
					<Link className="nav-item" to="/profile">
						<span className="ni">⚙</span> Profile Settings
					</Link>
					<div
						className="nav-item"
						onClick={() => {
							clearToken()
							navigate('/login')
						}}
					>
						<span className="ni">⏻</span> Log Out
					</div>
				</nav>

				<div className="tip-card">
					<div className="tip-label">
						<span className="tip-dot"></span> Pro Tip
					</div>
					<div className="tip-text">
						Filter by priority and knock out high-impact tasks first. Use keyboard shortcut{' '}
						<kbd
							style={{
								background: 'var(--elevated)',
								border: '0.5px solid var(--border)',
								borderRadius: '4px',
								padding: '1px 5px',
								fontSize: '10px',
								fontFamily: "'DM Mono', monospace",
							}}
						>
							Enter
						</kbd>{' '}
						to quickly add tasks.
					</div>
				</div>
			</aside>

			<main className="main">
				<div className="main-header">
					<div>
						<div className="page-title">
							<span className="page-title-icon">⊟</span>
							Task Overview
						</div>
						<div className="page-sub">Manage your tasks efficiently</div>
					</div>
					<button className="btn-add" onClick={openModal}>
						+ Add New Task
					</button>
				</div>

				<div className="stat-grid">
					<div className="stat-cell" style={{ animationDelay: '.00s' }}>
						<div className="stat-pip" style={{ background: 'var(--text-muted)' }}></div>
						<div className="stat-num" id="s-total" style={{ color: 'var(--text)' }}>
							{total}
						</div>
						<div className="stat-lbl">Total Tasks</div>
					</div>
					<div className="stat-cell" style={{ animationDelay: '.06s' }}>
						<div className="stat-pip" style={{ background: 'var(--low)' }}></div>
						<div className="stat-num" id="s-low" style={{ color: 'var(--low)' }}>
							{lowCount}
						</div>
						<div className="stat-lbl">Low Priority</div>
					</div>
					<div className="stat-cell" style={{ animationDelay: '.12s' }}>
						<div className="stat-pip" style={{ background: 'var(--medium)' }}></div>
						<div className="stat-num" id="s-med" style={{ color: 'var(--medium)' }}>
							{medCount}
						</div>
						<div className="stat-lbl">Medium Priority</div>
					</div>
					<div className="stat-cell" style={{ animationDelay: '.18s' }}>
						<div className="stat-pip" style={{ background: 'var(--high)' }}></div>
						<div className="stat-num" id="s-high" style={{ color: 'var(--high)' }}>
							{highCount}
						</div>
						<div className="stat-lbl">High Priority</div>
					</div>
				</div>

				<div className="task-panel">
					<div className="task-hd">
						<div className="task-hd-left">
							All Tasks
							<span className="task-badge" id="task-count">
								{filteredTasks.length}
							</span>
						</div>
						<div className="filter-row" id="filter-row">
							<form className="task-search" onSubmit={(event) => event.preventDefault()}>
								<div className="task-search-field">
									<input
										className="task-search-input"
										type="text"
										placeholder="Search tasks"
										value={searchTerm}
										onChange={(event) => setSearchTerm(event.target.value)}
									/>
									<button
										className={`task-search-clear ${searchTerm ? 'show' : ''}`}
										type="button"
										aria-label="Clear search"
										onClick={() => setSearchTerm('')}
									>
										×
									</button>
								</div>
							</form>
							{['all', 'today', 'week', 'high', 'medium', 'low'].map((tab) => (
								<button
									key={tab}
									className={`f-tab ${activeTab === tab ? 'on' : ''}`}
									data-f={tab}
									onClick={() => handleTabClick(tab)}
								>
									{tab.charAt(0).toUpperCase() + tab.slice(1)}
								</button>
							))}
						</div>
					</div>

					<div className="task-list" id="task-list">
						{filteredTasks.length === 0 ? (
							<div className="empty" id="empty-state">
								<div className="empty-glyph">[ ]</div>
								<div className="empty-title">No tasks found</div>
								<div className="empty-hint">Create your first task to get started</div>
							</div>
						) : (
							filteredTasks.map((task, index) => (
								<div
									key={task.id}
									className={`t-item ${task.done ? 'done' : ''}`}
									style={{ animationDelay: `${index * 0.04}s` }}
								>
									<div className="t-check" onClick={() => toggleTask(task.id)}>
										{task.done ? '✓' : ''}
									</div>
									<div className="t-body">
										<div className="t-name">{task.name}</div>
										<div className="t-meta">
											<span className={`p-badge p-${task.priority}`}>{task.priority}</span>
											{task.date ? <span>Due {task.date}</span> : null}
											{task.desc ? (
												<span>
													· {task.desc.slice(0, 34)}
													{task.desc.length > 34 ? '…' : ''}
												</span>
											) : null}
										</div>
									</div>
									<button className="t-del t-edit" onClick={() => openEditModal(task)}>
										✎
									</button>
									<button className="t-del t-delete" onClick={() => deleteTask(task.id)}>
										✕
									</button>
								</div>
							))
						)}
					</div>

					<div className="add-row">
						<button className="btn-ghost" onClick={openModal}>
							+ Add New Task
						</button>
					</div>
				</div>
			</main>

			<aside className="panel">
				<div className="bento" style={{ animationDelay: '.08s' }}>
					<div className="b-label">↗ Task Statistics</div>
					<div className="mini-grid">
						<div className="mini-cell">
							<div className="mini-num" id="p-total" style={{ color: 'var(--text)' }}>
								{total}
							</div>
							<div className="mini-lbl">Total Tasks</div>
						</div>
						<div className="mini-cell">
							<div className="mini-num" id="p-done" style={{ color: 'var(--low)' }}>
								{doneCount}
							</div>
							<div className="mini-lbl">Completed</div>
						</div>
						<div className="mini-cell">
							<div className="mini-num" id="p-pend" style={{ color: 'var(--medium)' }}>
								{pendingCount}
							</div>
							<div className="mini-lbl">Pending</div>
						</div>
						<div className="mini-cell">
							<div className="mini-num" id="p-rate" style={{ color: 'var(--accent)' }}>
								{completionRate}%
							</div>
							<div className="mini-lbl">Completion</div>
						</div>
					</div>
				</div>

				<div className="bento" style={{ animationDelay: '.16s' }}>
					<div className="b-label">
						<span>◉ Task Progress</span>
						<span className="b-label-mono" id="prog-lbl">
							{doneCount} / {total}
						</span>
					</div>
					<div className="prog-track">
						<div className="prog-fill" id="prog-fill" style={{ width: `${completionRate}%` }}></div>
					</div>
				</div>

				<div className="bento" style={{ animationDelay: '.24s', flex: 1 }}>
					<div className="b-label">◷ Recent Activity</div>
					<div id="activity-list">
						{activity.length === 0 ? (
							<div className="act-empty">
								<div className="act-glyph">{'{ }'}</div>
								<div className="act-none">No recent activity</div>
								<div className="act-sub">Tasks will appear here</div>
							</div>
						) : (
							activity.map((item, index) => (
								<div className="act-item" key={item.at.getTime()} style={{ animationDelay: `${index * 0.03}s` }}>
									<div
										className="act-dot"
										style={{
											background:
												item.pri === 'high'
													? 'var(--high)'
													: item.pri === 'low'
														? 'var(--low)'
														: 'var(--accent)',
										}}
									></div>
									<div className="act-text">{item.text}</div>
									<div className="act-time">{formatAgo(item.at)}</div>
								</div>
							))
						)}
					</div>
				</div>
			</aside>

			<div
				className={`overlay ${isModalOpen ? 'open' : ''}`}
				id="overlay"
				onClick={(event) => {
					if (event.target.id === 'overlay') closeModal()
				}}
			>
				<div className="modal" id="modal">
					<div className="m-title">
						{editingTaskId ? 'Edit Task' : 'Create New Task'}
					</div>
					<div className="m-sub">Add a task with priority and deadline</div>

					<div className="f-grp">
						<label className="f-lbl" htmlFor="inp-name">Task Name</label>
						<input
							className={`f-inp ${nameError ? 'err' : ''}`}
							id="inp-name"
							type="text"
							placeholder="What needs to be done?"
							value={name}
							onChange={(event) => setName(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') addTask()
							}}
							ref={nameRef}
						/>
					</div>
					<div className="f-grp">
						<label className="f-lbl" htmlFor="inp-desc">Description</label>
						<input
							className="f-inp"
							id="inp-desc"
							type="text"
							  placeholder="Optional details…"
							value={desc}
							onChange={(event) => setDesc(event.target.value)}
						/>
					</div>
					<div className="f-grp">
						<label className="f-lbl">Priority</label>
						<div className="pri-row">
							{['low', 'medium', 'high'].map((priority) => (
								<div
									key={priority}
									className={`pri-opt ${selectedPriority === priority ? `on-${priority}` : ''}`}
									data-p={priority}
									onClick={() => setSelectedPriority(priority)}
								>
									{priority.charAt(0).toUpperCase() + priority.slice(1)}
								</div>
							))}
						</div>
					</div>
					<div className="f-grp">
						<label className="f-lbl" htmlFor="inp-date">Due Date</label>
						<input
							className="f-inp"
							id="inp-date"
							type="date"
							value={date}
							onChange={(event) => setDate(event.target.value)}
						/>
					</div>

					<div className="m-actions">
						<button className="btn-cancel" onClick={closeModal}>Cancel</button>
						<button className="btn-ok" onClick={addTask}>
							{editingTaskId ? 'Save Changes →' : 'Add Task →'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
