import SignIn from "./SignInForm"
import { Suspense } from "react"


const Login: React.FC =  () =>
{ 
    return (<div className="h-screen flex items-center justify-center">  
    <Suspense>
        <SignIn/>
    </Suspense>
    </div> )
}

export default Login
