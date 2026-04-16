/**
 * Tickets API - integrates with backend ticket endpoints.
 *
 * - GET  /api/tickets        → returns { count, tickets } for logged-in employee
 * - POST /api/tickets/create → creates ticket with { title, description, category, priority }
 *
 * JWT is attached automatically by axios interceptor.
 */

import axiosInstance from './axios'

/**
 * Fetch a single ticket by ID.
 * Employee: own tickets only. IT/Admin: any ticket.
 *
 * @param {string} ticketId - ticket ID
 * @returns {Promise<object>} ticket
 */
export async function getTicket(ticketId) {
  const { data } = await axiosInstance.get(`/api/tickets/${ticketId}`)
  return data
}

/**
 * Fetch tickets for the logged-in user.
 * Employee: own tickets only. IT/Admin: all tickets (not used in Phase 3).
 *
 * @returns {Promise<{ count: number, tickets: array }>}
 */
export async function getTickets() {
  const { data } = await axiosInstance.get('/api/tickets')
  return { count: data.count, tickets: data.tickets || [] }
}

/**
 * Create a new ticket.
 *
 * @param {Object} payload - { title, description, category, priority }
 * @param {string} payload.title - required
 * @param {string} payload.description - required
 * @param {string} payload.category - Network | Software | Hardware | Other
 * @param {string} payload.priority - Low | Medium | High
 * @returns {Promise<{ message: string, ticket: object }>}
 */
export async function createTicket(payload) {
  const { data } = await axiosInstance.post('/api/tickets/create', payload)
  return { message: data.message, ticket: data.ticket }
}

/**
 * Assign ticket to IT user (Admin only).
 *
 * @param {string} ticketId - ticket ID
 * @param {string} assignedTo - user ID of IT staff
 * @returns {Promise<{ message: string, ticket: object }>}
 */
export async function assignTicket(ticketId, assignedTo) {
  const { data } = await axiosInstance.put(`/api/tickets/assign/${ticketId}`, { assignedTo })
  return { message: data.message, ticket: data.ticket }
}

/**
 * Update ticket status (IT/Admin only).
 *
 * @param {string} ticketId - ticket ID
 * @param {string} status - Open | Assigned | In Progress | Resolved | Closed
 * @returns {Promise<{ message: string, ticket: object }>}
 */
export async function updateTicketStatus(ticketId, status) {
  const { data } = await axiosInstance.put(`/api/tickets/update-status/${ticketId}`, { status })
  return { message: data.message, ticket: data.ticket }
}
