import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';
import AxiosSecure from '../../Hooks/Axios/AxiosSecure';
import useAuth from '../../Hooks/UserAuth/UseAuth';
import { Toaster } from 'react-hot-toast';
const PaymentForm = ({paymentDetails}) => {
const [clientSecret,setClientSecret]  = useState('');
const [paymentError,setPaymentError] = useState('');
const [transitionId,setTransitionId] = useState('');
const [isProcessing,setProcessing] = useState(false);
const useAxiosSecure = AxiosSecure();
const {user} = useAuth()
const elements = useElements();
const stripe = useStripe();

useEffect(()=>{
 if(paymentDetails.salary){
  useAxiosSecure.post(`/api/v1/paymentSecret`,{
    amount: paymentDetails.salary 
     })
     .then(res => setClientSecret(res.data.client_secret))
 }
},[paymentDetails])

const handelSubmit =async(e)=>{
  
    e.preventDefault();
    setPaymentError('')
    setProcessing(true)
    const form = e.target;
    const amount = paymentDetails.salary;
    const month = form.month.value;
    const year = parseInt(form.year.value);
    const date = new Date();
    if(year < date.getFullYear()){
      setPaymentError('Please enter a valid year')
      setProcessing(false)
      return ;
    }
    setTransitionId('')
 if(!stripe || !elements){
  setProcessing(false)
    return;
 } 
 const card = elements.getElement(CardElement);
 if(card === null){
  setProcessing(false)
    return;
 }
 const {error,paymentMethod} = await stripe.createPaymentMethod({
type:'card',
card
 })
 if(error){
    console.log('Payment error',error)
    setProcessing(false)
    return;
 }
 
 const {paymentIntent,error:confirmError} = await stripe.confirmCardPayment(clientSecret,{
  payment_method:{
    card:card,
    billing_details:{
      email: user?.email || 'anonymous',
      name:user?.displayName || 'anonymous'
    }
  }
 })
 if(confirmError){
  setProcessing(false)
  console.log('confirmError',confirmError)
  return;
 }
 else{
  setTransitionId(paymentIntent.id)
  const newDate = new Date();
  const payment = {
    payment_id : paymentIntent.id,
    amount: paymentDetails.salary,
    employee_name : paymentDetails.name,
    employee: paymentDetails.email,
    date:`${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()}`,
    month: month,
    year: year

  }
  useAxiosSecure.post('/api/v1/employee/payment',payment)
  .then(res => {
 if(res.data.insertedId){
  setProcessing(false)
  toast.success('Payment successful!');

 }
  })
 }
    }
    


    return (
        <div>
          <form action="" className='' onSubmit={handelSubmit}>
<div className='space-y-3 py-2'>
<h1 className='text-black'>Employee Name: {paymentDetails.name}</h1>
<h1 className='text-black'>Amount: ${paymentDetails.salary}</h1>
{/* <input type="month" name="" id=""className='py-2 border-2 border-black w-full rounded'/> */}
<div>
<CardElement  options={{
          style: {
            base: {
              fontSize: '16px',
              color: 'black',
              padding: '8px 0px',
              '::placeholder': {
                color: '#aab7c4',
                
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}></CardElement>
</div>
<div className='space-y-1'>
<p>Select month:</p>
<select id="monthSelect" name="month" className='py-2 border-2 border-black w-full rounded px-2'>
     <option value="01">January</option>
     <option value="02">February</option>
     <option value="03">March</option>
     <option value="04">April</option>
     <option value="05">May</option>
     <option value="06">June</option>
     <option value="07">July</option>
     <option value="08">August</option>
     <option value="09">September</option>
     <option value="10">October</option>
     <option value="11">November</option>
     <option value="12">December</option>
 </select>
</div>
 
<div className='space-y-1'>
<p>Enter year </p>
<input type="number" name="year" id="" className='py-2 border-2 border-black w-full  px-2 rounded'/>

</div>
</div>
<button type='submit' disabled = {!paymentDetails.isVerified || !stripe || !clientSecret} className= {`w-full ${!paymentDetails.isVerified || !stripe || !clientSecret ? 'bg-green-200' : 'bg-green-600'} text-white py-2 rounded-md`}>Confirm Payment</button>
{paymentError&& <p className='text-red-600'>{paymentError}</p>}
</form>
            {/* <h3 className='py-1 text-black'>Card details:</h3> */}
            <Toaster
  position="top-center"
  reverseOrder={false}
/>
        </div>
    );
}

export default PaymentForm;
