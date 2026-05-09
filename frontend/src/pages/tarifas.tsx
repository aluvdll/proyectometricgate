export const Tarifas = () => {
    return (
<>
<section className="flex items-center justify-center mt-15 pb-10 dark:bg-gray-800">
    <div className="p-4 sm:px-10 flex flex-col justify-center items-center text-base h-100vh mx-auto" id="pricing">
        <h3 className="text-5xl font-semibold text-center flex gap-2 justify-center mb-10">Precios a medida...</h3>
        <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="ring-1 ring-gray-200 rounded-3xl p-8 xl:p-10">
                <div className="flex items-center justify-between gap-x-4">
                    <h3 id="tier-standard" className="text-gray-900 dark:text-white text-2xl font-semibold leading-8">Basica</h3>
                </div>
                <p className="mt-4 text-base leading-6 text-gray-900 dark:text-gray-100">Cuota mensual</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="line-through text-2xl font-sans text-gray-500/70"></span><span
                        className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">150€/mes</span>
                </p>
                <a href=""
                    aria-describedby="tier-standard"
                    className="text-orange-500 ring-1 ring-inset ring-blue-200 hover:bg-orange-800 mt-6 block rounded-md py-2 px-3 hover:border-2 hover:border-amber-50 text-center text-base font-medium leading-6"
                    target="_blank">Paga ahora</a>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-900 dark:text-gray-100 xl:mt-10">
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-orange-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Perfil comercial/tecnico
                    </li>
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-orange-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Respaldo de datos anuales por pago
                    </li>
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-orange-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Asistencia remota básica
                    </li>
                </ul>
            </div>
            <div className="ring-2 ring-orange-500 rounded-3xl p-8 xl:p-10">
                <div className="flex items-center justify-between gap-x-4">
                    <h3 id="tier-extended" className="text-orange-500 text-2xl font-semibold leading-8">Extendida</h3>
                    <p className="rounded-full bg-orange-500 text-white dark:text-white px-2.5 py-1 text-xs font-semibold leading-5 text-white-500">
                        Popular </p>
                </div>
                <p className="mt-4 text-base leading-6 text-gray-900 dark:text-gray-100">Cuota anual</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="line-through text-2xl font-sans text-gray-500/70">150€</span><span
                        className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">125€/mes</span>
                </p>
                <a href=""
                    aria-describedby="tier-extended"
                    className="bg-orange-500 text-white shadow-sm  mt-6 block rounded-md py-2 px-3 text-center hover:border-2 hover:border-amber-50 hover:bg-orange-800 text-base font-medium leading-6 "
                    target="_blank">Paga ahora</a>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-900 dark:text-gray-100 xl:mt-10">
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-orange-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Asistencia remota premium
                    </li>
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-orange-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Perfil administrador activo
                    </li>
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke-width="1.5" stroke="currentColor" aria-hidden="true"
                            className="h-6 w-5 flex-none text-orange-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Respaldo de datos ilimitado
                    </li>
                </ul>
            </div>
        </div>
    </div>
</section>
</>
    )
}