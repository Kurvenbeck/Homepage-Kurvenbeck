-- Härtet die öffentliche INSERT-Policy: statt `WITH CHECK (true)` müssen anonyme
-- Anfragen wohlgeformt sein und dürfen keinen abweichenden Status setzen. Zusätzlich
-- zur serverseitigen Validierung (Defense-in-Depth gegen direkt eingekippte Müll-Zeilen).

drop policy "catering_requests_public_insert" on public.catering_requests;

create policy "catering_requests_public_insert" on public.catering_requests
  for insert to anon, authenticated
  with check (
    status = 'neu'
    and char_length(name) between 1 and 200
    and char_length(email) between 3 and 200
    and position('@' in email) > 1
    and (guests is null or (guests >= 1 and guests <= 100000))
    and (occasion is null or char_length(occasion) <= 100)
    and (message is null or char_length(message) <= 5000)
  );
