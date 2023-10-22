import { getByRole, render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react'
import type { Session } from "next-auth";
import Login from '../pages/login'
import { AppWrapper } from '../pages/_app'
import '@testing-library/jest-dom'
import { describe, test, expect } from '@jest/globals'
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { UserAuthForm } from '../components/user-auth-form'

const mockSession: Session = {
  user: {
    email: "mock@test.com",
    name: "Mocky Mouse",
    image: null
  },
  expires: '05 October 2024 14:48 UTC'

}

// @ts-ignore
jest.mock('next/router', () => ({
  // @ts-ignore
  useRouter: jest.fn()
}))

// mockSession is redefined because mocks are hoisted above import statements
// @ts-ignore
jest.mock("next-auth/react", () => {
  // @ts-ignore
  const originalModule = jest.requireActual('next-auth/react');
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { name: "admin", email: "admin@mock.com" }
  };
  return {
    ...originalModule,
    // @ts-ignore
    useSession: jest.fn(() => {
      return { data: mockSession, status: 'authenticated' }  // return type is [] in v3 but changed to {} in v4
    }),
    // @ts-ignore
    signIn: jest.fn(() => {
      return { ok: true }
    })
  };
});

describe('Index Page', () => {
  test('Authentication: Redirect if session already exists', () => {
    // setup a new mocking function for push method
    // @ts-ignore
    const pushMock = jest.fn()
    // mock a return value on useRouter
    // @ts-ignore
    useRouter.mockReturnValue({
      query: {},
      push: pushMock,
    })
    render(<AppWrapper session={mockSession} > <Login /></AppWrapper >)

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })

  test('Match Snapshot', async () => {
    const { asFragment } = render(<AppWrapper session={mockSession} > <Login /></AppWrapper >)
    expect(asFragment()).toMatchSnapshot()
  })
})

