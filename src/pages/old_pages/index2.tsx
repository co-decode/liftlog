///import styles from '@/styles/Home.module.css'
import { trpc } from '../utils/trpc';
import { inferProcedureInput } from '@trpc/server';
import type { AppRouter } from '@/server/routers/_app';
import { useForm, SubmitHandler } from "react-hook-form";
import Head from 'next/head';
import Link from 'next/link';

type Inputs = {
  username: string,
  password: string,
};


export default function IndexPage() {

    const insertOne = trpc.insertOne.useMutation({
        onSuccess() {
            console.log("Insertion Successful!")
        },
    });
    const getAll = trpc.findAll.useQuery()
    const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        type Input = inferProcedureInput<AppRouter['insertOne']>;
        const input: Input = data;
        try {
            await insertOne.mutateAsync(input);
            getAll.refetch();
        }
        catch (cause) {
            console.error({ cause }, 'Failed to insert');
        }
    };

    console.log(watch("username")) // watch input value by passing the name of it

    return (
        <div>
            <Head>
                <title>LiftLog</title>
                <meta property="og:title" content="My page title" key="title" />
            </Head>
            <h1> Welcome! </h1>
            <button 
            className='bg-red-500 text-xs text-red-900'
            onClick={async () => {
                type Input = inferProcedureInput<AppRouter['insertOne']>;
                const input: Input = {
                    username: 'test2',
                    password: 'password',
                }
                try {
                    await insertOne.mutateAsync(input);
                }
                catch (cause) {
                    console.error({ cause }, 'Failed to insert');
                }
            }}
            >
            Insert a Post
            </button>
            <pre style={{color: "white"}}>{JSON.stringify(getAll.data)}</pre>
            {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* register your input into the hook by invoking the "register" function */}
              <input defaultValue="test" {...register("username", {required: true})} />
              {errors.username && <span>This field is required</span>}
              
              {/* include validation with required or other standard HTML validation rules */}
              <input type='password' {...register("password", { required: true })} />
              {/* errors will return when field validation fails  */}
              {errors.password && <span>This field is required</span>}
              
              <input type="submit" />
            </form>
            <Link href="/dashboard">Dashboard</Link>
        </div>
    );
}
