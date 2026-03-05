from django.http.response import HttpResponse
from django.views.generic.edit import FormView
from django.urls import reverse_lazy
from accounts.forms import edit_form
from django.contrib.auth import update_session_auth_hash
from django.shortcuts import redirect

class EditView(FormView):
    form_class = edit_form.EditForm
    template_name = 'accounts/edit.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return super().dispatch(request, *args, **kwargs)
        else:
            return HttpResponse('Unauthorized', status = 401)
        
    def get_initial(self):
        initial = super().get_initial()
        initial['email'] = self.request.user.email
        initial['first_name'] = self.request.user.first_name
        initial['last_name'] = self.request.user.last_name
        return initial.copy()
    
    def form_valid(self, form, **kwargs):
        user = self.request.user
        context = self.get_context_data(**kwargs)
        if 'password1' in form.cleaned_data and form.cleaned_data['password1'] != "":
            if ('password2' not in form.cleaned_data) or form.cleaned_data['password1'] != form.cleaned_data['password2']:
                # context = self.get_context_data(**kwargs)
                context['error_message'] = "The two password fields didn't match"
                return self.render_to_response(context)
            else:
                if len(form.cleaned_data['password1']) < 8:
                    # context = self.get_context_data(**kwargs)
                    context['error_message'] = "This password is too short. It must contain at least 8 characters"
                    return self.render_to_response(context)
                else:
                    user.set_password(form.cleaned_data['password1'])
            
        if 'email' in form.cleaned_data:
            if '@' in form.cleaned_data['email'] or form.cleaned_data['email'] == "":
                user.email = form.cleaned_data['email']
            else:
                context['error_message'] = "Enter a valid email address"
                return self.render_to_response(context)
        
        if 'first_name' in form.cleaned_data:
            user.first_name = form.cleaned_data['first_name']

        if 'last_name' in form.cleaned_data:
            user.last_name = form.cleaned_data['last_name']

        user.save()
        update_session_auth_hash(self.request, user)
        return redirect('accounts:profile_view')