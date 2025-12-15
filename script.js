console.log('Invite code:', inviteCode);

const SUPABASE_URL = 'https://eelojiokpgewyiceyche.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbG9qaW9rcGdld3lpY2V5Y2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDcxNTUsImV4cCI6MjA4MTMyMzE1NX0.o4y1KtVdRiGx0v4iakDc2UGshiyEnkDF57I6irI-INQ';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const params = new URLSearchParams(window.location.search);
const inviteCode = params.get('code');

let remainingSpots = 0;

async function loadInvite() {
  const { data: invite, error: inviteError } = await supabaseClient
    .from('invites')
    .select('*')
    .eq('invite_code', inviteCode)
    .maybeSingle();

  if (inviteError) {
    alert('Invalid invite link');
    return;
  }

  const { data: rsvps } = await supabaseClient
    .from('rsvps')
    .select('guest_count')
    .eq('invite_code', inviteCode);

  const used = rsvps.reduce((sum, r) => sum + r.guest_count, 0);
  remainingSpots = invite.max_guests - used;

  document.getElementById('welcome').innerText =
    `Welcome ${invite.guest_name}`;
  document.getElementById('remaining').innerText =
    `Remaining spots: ${remainingSpots}`;

  const dropdown = document.getElementById('guestCount');
  dropdown.innerHTML = '';

  for (let i = 1; i <= remainingSpots; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = i;
    dropdown.appendChild(option);
  }

  if (remainingSpots > 0) {
    document.getElementById('registry').style.display = 'block';
  }
}

async function submitRSVP() {
  const guestCount = Number(
    document.getElementById('guestCount').value
  );

  if (!guestCount || guestCount > remainingSpots) {
    alert('Invalid number of guests');
    return;
  }

  await supabaseClient.from('rsvps').insert({
    invite_code: inviteCode,
    guest_count: guestCount
  });

  alert('RSVP submitted!');
  location.reload();
}

console.log('Supabase connected:', supabaseClient);

loadInvite();